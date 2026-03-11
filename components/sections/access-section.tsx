import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Clock } from "lucide-react"

export default function AccessSection() {
  return (
    <section id="access" className="bg-[#776B5D] text-white py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-16 tracking-wider">
          ACCESS
        </h2>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-medium mb-2">住所</h3>
                <p className="text-lg">〒314-0344 茨城県神栖市土合本町</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-medium mb-2">営業時間</h3>
                <p className="text-lg">10:00～16:00</p>
                <p className="text-sm text-white/80 mt-1">※ 予約制となっております</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-medium mb-2">お問い合わせ</h3>
                <p className="text-lg">LINEにてご連絡ください</p>
              </div>
            </div>
          </div>
          <Card className="overflow-hidden border-none shadow-lg">
            <CardContent className="p-0">
              <div className="relative aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3236.3102414746063!2d140.77937052843856!3d35.7923162926145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60231b079a4f8471%3A0x31b7be6adb1889f6!2zUmVuY29udHJlKOODqeODs-OCs-ODs-ODiOODqyk!5e0!3m2!1sja!2sjp!4v1742309220380!5m2!1sja!2sjp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="aspect-video"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
