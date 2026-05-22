import Link from "next/link";

export default function NewsSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">ព័ត៌មានកសិកម្ម</h2>

      <Link
        href="https://agro-web-app-xnyc.vercel.app/knowledge/detail-guide/50b7c608-318b-4b93-a749-6060bee2b503"
        className="block"
      >
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition">
          <div className="relative w-full h-48">
            <img
              src="https://kh-products.ingjin50.workers.dev/products/guide_image.jpg"
              alt="ជី"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="text-white text-sm font-medium">
                បច្ចេកទេសសំខាន់ៗចំនួន ៨ ដើម្បីបង្កើនផលិតភាពដំណាំ
              </h3>
              <p className="text-white/70 text-xs mt-2">និពន្ធដោយ៖ សំណាង</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
