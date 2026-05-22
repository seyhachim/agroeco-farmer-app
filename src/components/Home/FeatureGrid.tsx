import Link from "next/link";
import { MapPin, BookOpen, ShoppingBag, MessageCircle } from "lucide-react";

export default function FeatureGrid() {
  const features = [
    { icon: MapPin, label: "ផែនទឹកសិដ្ឋាន", href: "/map" },
    { icon: BookOpen, label: "ចំណេះដឹង", href: "/knowledge" },
    { icon: ShoppingBag, label: "ផ្សារ", href: "/resource" },
    { icon: MessageCircle, label: "វេទិកា", href: "/forum" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {features.map((item, i) => (
        <Link href={item.href} key={i}>
          <div className="bg-white rounded-lg p-4 shadow-sm border flex items-center justify-between hover:shadow-md transition">
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5 text-green-800" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
