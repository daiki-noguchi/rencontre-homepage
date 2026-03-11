"use client"

import Image from "next/image"

export default function ConceptSection() {
  return (
    <section id="concept" className="bg-[#cee6c1] py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-16 tracking-wider text-[#2E5A1C]">
          CONCEPT
        </h2>

        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center bg-white/90 backdrop-blur rounded-lg p-6 shadow-lg">
            <div className="relative aspect-square">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_8254.JPG-Y1G7pxIviXc88L7f2Ctot8hYwFkq0T.jpeg"
                alt="Rencontre logo with dried roses"
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-4">
              <p className="text-lg font-medium text-[#2E5A1C]">
                Rencontre（ランコントル）はフランス語で出会いと言う意味です。
              </p>
              <p className="text-gray-600">
                出会うもの全てに対して、心を込めて丁寧に向き合い大切にしていきたいとの想いを込めて名付けました。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
