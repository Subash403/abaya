import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'products';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage bucket
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.warn('[Supabase Storage Upload Error]:', uploadError.message);
      // If bucket does not exist or storage is not configured, return an informative error
      return NextResponse.json(
        {
          error: `Storage upload failed: ${uploadError.message}. Ensure the '${bucket}' bucket exists in your Supabase project (run supabase/schema.sql).`,
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal upload error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
