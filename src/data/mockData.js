// Replace with real API calls
export const initialPosts = [
  { id: 1, title: "Designing for slow connections", author: "Maya", status: "published", views: 12480, date: "Sep 24" },
  { id: 2, title: "A field guide to CSS container queries", author: "Dev", status: "published", views: 9312, date: "Sep 19" },
  { id: 3, title: "What I learned running a newsletter for a year", author: "Maya", status: "draft", views: 0, date: "Sep 27" },
  { id: 4, title: "Why your images are too big", author: "Ravi", status: "published", views: 5120, date: "Sep 11" },
  { id: 5, title: "Writing release notes people read", author: "Dev", status: "scheduled", views: 0, date: "Oct 2" },
  { id: 6, title: "Notes on accessible color palettes", author: "Ravi", status: "draft", views: 0, date: "Sep 26" },
];

export const initialComments = [
  { id: 1, name: "Anita S.", text: "The container query examples finally made it click for me.", post: "CSS container queries", ok: false },
  { id: 2, name: "Jon P.", text: "Could you cover srcset next? My hero image is 4MB.", post: "Your images are too big", ok: false },
  { id: 3, name: "Lee W.", text: "Great read. Sharing with my team.", post: "Slow connections", ok: true },
];

export const weeklyViews = [3200, 4100, 3800, 5200, 4900, 6800, 7400];
export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
