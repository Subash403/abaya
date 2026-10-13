'use client';

import React, { useState } from 'react';
import { useModals } from '@/context/ModalContext';
import { X, Ruler, Sparkles } from 'lucide-react';

interface SizeRow {
  size: string;
  heightFt: string;
  heightCm: string;
  abayaLengthIn: string;
  abayaLengthCm: string;
  recommendation: string;
}

const sizeData: SizeRow[] = [
  {
    size: '52',
    heightFt: '5\'0" - 5\'1"',
    heightCm: '152 - 155 cm',
    abayaLengthIn: '52"',
    abayaLengthCm: '132 cm',
    recommendation: 'Petite silhouette; hits gracefully at the ankle.',
  },
  {
    size: '54',
    heightFt: '5\'2" - 5\'3"',
    heightCm: '157 - 160 cm',
    abayaLengthIn: '54"',
    abayaLengthCm: '137 cm',
    recommendation: 'Classic tailored length for everyday flats or low heels.',
  },
  {
    size: '56',
    heightFt: '5\'4" - 5\'5"',
    heightCm: '162 - 165 cm',
    abayaLengthIn: '56"',
    abayaLengthCm: '142 cm',
    recommendation: 'Our most popular regular fit; flowing modest drape.',
  },
  {
    size: '58',
    heightFt: '5\'6" - 5\'7"',
    heightCm: '167 - 170 cm',
    abayaLengthIn: '58"',
    abayaLengthCm: '147 cm',
    recommendation: 'Designed for statuesque heights or pairing with heels.',
  },
  {
    size: '60',
    heightFt: '5\'8" - 5\'10"+',
    heightCm: '172 - 178+ cm',
    abayaLengthIn: '60"',
    abayaLengthCm: '152 cm',
    recommendation: 'Full-length floor drape for tall silhouettes.',
  },
];

export default function SizeGuideModal() {
  const { isSizeGuideOpen, closeSizeGuide, openInquiry } = useModals();
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');

  if (!isSizeGuideOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18181B]/75 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#E8E8EC] shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E8EC] bg-[#F7F7F9]">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-5 h-5 text-[#7C5C8A]" />
            <div>
              <h3 className="font-serif text-xl tracking-wider text-[#18181B] uppercase font-semibold">
                Wala Abaya Sizing & Fit Guide
              </h3>
              <p className="text-[11px] tracking-widest text-[#71717A] uppercase">
                Chennai Atelier Proportions & Sizing
              </p>
            </div>
          </div>
          <button
            onClick={closeSizeGuide}
            className="p-1.5 text-[#18181B]/60 hover:text-[#18181B] transition-colors rounded-full hover:bg-[#E8E8EC]"
            aria-label="Close size guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Unit Switcher */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#52525B] font-light">
              Abaya sizes correspond directly to garment length in inches from shoulder crest to hem.
            </p>
            <div className="flex items-center border border-[#E8E8EC] rounded-full p-0.5 bg-[#FFFFFF]">
              <button
                type="button"
                onClick={() => setUnit('imperial')}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  unit === 'imperial'
                    ? 'bg-[#7C5C8A] text-white font-semibold shadow-sm'
                    : 'text-[#52525B] hover:text-[#18181B]'
                }`}
              >
                Inches / Ft
              </button>
              <button
                type="button"
                onClick={() => setUnit('metric')}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  unit === 'metric'
                    ? 'bg-[#7C5C8A] text-white font-semibold shadow-sm'
                    : 'text-[#52525B] hover:text-[#18181B]'
                }`}
              >
                Centimeters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="border border-[#E8E8EC] rounded-sm overflow-hidden bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#18181B] text-white text-[11px] tracking-wider uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Garment Length</th>
                  <th className="py-3 px-4">Recommended Height</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Drape Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8EC] text-xs">
                {sizeData.map((row) => (
                  <tr key={row.size} className="hover:bg-[#F7F7F9] transition-colors">
                    <td className="py-3.5 px-4 font-serif text-base font-bold text-[#18181B]">
                      {row.size}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#18181B]">
                      {unit === 'imperial' ? row.abayaLengthIn : row.abayaLengthCm}
                    </td>
                    <td className="py-3.5 px-4 text-[#52525B]">
                      {unit === 'imperial' ? row.heightFt : row.heightCm}
                    </td>
                    <td className="py-3.5 px-4 text-[#71717A] hidden sm:table-cell">
                      {row.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How to Measure Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 border border-[#E8E8EC] rounded-sm bg-[#FFFFFF]">
              <span className="text-[10px] tracking-widest text-[#7C5C8A] uppercase font-bold block mb-1">
                Step 1: Length
              </span>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Measure from the highest point of your shoulder down to your ankle or heel depending on preferred footwear.
              </p>
            </div>
            <div className="p-3.5 border border-[#E8E8EC] rounded-sm bg-[#FFFFFF]">
              <span className="text-[10px] tracking-widest text-[#7C5C8A] uppercase font-bold block mb-1">
                Step 2: Bust & Modest Fit
              </span>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Our bespoke cuts feature generous modest draping with 4–6 inches of intentional modest ease.
              </p>
            </div>
            <div className="p-3.5 border border-[#E8E8EC] rounded-sm bg-[#FFFFFF]">
              <span className="text-[10px] tracking-widest text-[#7C5C8A] uppercase font-bold block mb-1">
                Step 3: Sleeve Span
              </span>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Measured from the base of the back neck, over the shoulder down to your wrist bone.
              </p>
            </div>
          </div>

          {/* Custom Tailoring Callout */}
          <div className="p-4 bg-[#18181B] text-white rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-full bg-[#7C5C8A]/20 text-[#7C5C8A]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif text-sm tracking-wide text-white">
                  Need Made-to-Measure Tailoring?
                </h4>
                <p className="text-xs text-[#D4D4D8]">
                  Our Chennai atelier accommodates custom heights, sleeve alterations, and personalized fit.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                closeSizeGuide();
                openInquiry(null);
              }}
              className="whitespace-nowrap px-4 py-2 text-xs tracking-wider uppercase font-semibold bg-[#7C5C8A] hover:bg-[#6A4A78] text-white transition-colors rounded-sm"
            >
              Request Custom Sizing
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8E8EC] bg-[#F7F7F9] flex justify-end">
          <button
            type="button"
            onClick={closeSizeGuide}
            className="px-5 py-2 text-xs tracking-widest uppercase font-semibold text-[#18181B] hover:bg-[#E8E8EC] border border-[#E8E8EC] transition-all rounded-sm"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
