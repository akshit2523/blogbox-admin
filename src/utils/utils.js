export const BLOG_CATEGORIES = [
  "Travel",
  "Design",
  "Lifestyle",
  "Technology",
  "Food",
  "Business",
  "Photography",
  "Health",
  "Fashion",
  "Other",
];

export const getCategoryOptions = () => {
  return BLOG_CATEGORIES.map((category) => ({
    label: category,
    value: category,
  }));
};

export const normalizeCategory = (category) => {
  if (!category) return "";

  if (typeof category === "string") {
    return category.trim();
  }

  if (typeof category === "object") {
    return category.name || category.label || category.value || "";
  }

  return "";
};

export const getCategoryLabel = (category) => {
  return normalizeCategory(category);
};

export const getCategorySlug = (category) => {
  return normalizeCategory(category)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

// Tags options
export const BLOG_TAGS = [
  "Travel Tips",
  "Destinations",
  "Adventure",
  "Culture",
  "Food",
  "Photography",
  "Lifestyle",
  "Design",
  "Technology",
  "Business",
  "Travel Guide",
  "Reviews",
];

export const getTagOptions = () => {
  return BLOG_TAGS.map((tag) => ({
    label: tag,
    value: tag,
  }));
};

export const normalizeTags = (tags) => {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags
      .map((tag) => {
        if (typeof tag === "string") return tag.trim();

        if (typeof tag === "object") {
          return tag.name || tag.label || tag.value || "";
        }

        return "";
      })
      .filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

// status options
export const BLOG_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

export const BLOG_STATUS_VALUES = Object.values(BLOG_STATUS);

export const getStatusOptions = () => {
  return BLOG_STATUS_VALUES.map((status) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1),
    value: status,
  }));
};

export const normalizeStatus = (status) => {
  if (!status) return BLOG_STATUS.DRAFT;

  const normalized = String(status).toLowerCase().trim();

  return BLOG_STATUS_VALUES.includes(normalized)
    ? normalized
    : BLOG_STATUS.DRAFT;
};
