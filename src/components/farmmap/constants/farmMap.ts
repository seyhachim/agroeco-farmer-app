export const REMARKS = [
  { label: "Farm", icon: "/icons/farmmap/location_farm.svg" },
  { label: "NGO", icon: "/icons/farmmap/location_ngo.svg" },
  { label: "Store/Market", icon: "/icons/farmmap/location_store.svg" },
  { label: "Education Center", icon: "/icons/farmmap/location_education.svg" },
  {
    label: "Processing Facility",
    icon: "/icons/farmmap/location_processing.svg",
  },
];

export const FILTER_MAP: Record<string, string[]> = {
  ទាំងអស់: [
    "Farm",
    "NGO",
    "Store/Market",
    "Education Center",
    "Processing Facility",
  ],
  អង្គការ: ["NGO", "Education Center"],
  ហាង: ["Store/Market"],
  សត្វ: ["Farm"],
  សម្ភារៈ: ["Processing Facility"],
  បន្លែ: ["Farm"],
  អង្គការក្រៅរដ្ឋាភិបាល: ["NGO"],
};
