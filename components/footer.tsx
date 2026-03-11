import { Instagram } from "lucide-react"
import { LineIcon } from "@/components/icons/line-icon"

export default function Footer() {
  return (
    <footer className="bg-[#776B5D] text-white py-8 border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm">〒314-0344 茨城県神栖市土合本町</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <p className="text-sm">SNS</p>
              <a
                href="https://www.instagram.com/rencontre25"
                className="hover:opacity-80 transition-opacity"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://page.line.me/gtf0394w"
                className="hover:opacity-80 transition-opacity"
                aria-label="LINE"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LineIcon className="h-6 w-6" bgColor="currentColor" iconColor="#776B5D" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-white/70">COPYRIGHT © 2025 ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  )
}
