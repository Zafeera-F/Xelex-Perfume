// HeroSlide service — business logic only, mirrors the layering already
// established by adminProduct.service.js.

import { heroSlideRepository } from "../repositories/heroSlide.repository.js";
import { ApiError } from "../utils/ApiError.js";

function toPublic(slide) {
  return {
    id: slide.id,
    imageUrl: slide.imageUrl,
    heading: slide.heading,
    description: slide.description,
    buttonText: slide.buttonText,
    buttonLink: slide.buttonLink,
  };
}

export const heroSlideService = {
  async listPublic() {
    const slides = await heroSlideRepository.findAllEnabled();
    return slides.map(toPublic);
  },

  listForAdmin() {
    return heroSlideRepository.findAllForAdmin();
  },

  async getById(id) {
    const slide = await heroSlideRepository.findById(id);
    if (!slide) {
      throw new ApiError(404, "Hero slide not found");
    }
    return slide;
  },

  create(fields) {
    return heroSlideRepository.create(fields);
  },

  async update(id, fields) {
    const existing = await heroSlideRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, "Hero slide not found");
    }
    return heroSlideRepository.update(id, fields);
  },

  async delete(id) {
    const existing = await heroSlideRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, "Hero slide not found");
    }
    await heroSlideRepository.delete(id);
  },

  reorder(orderedIds) {
    return heroSlideRepository.reorder(orderedIds);
  },
};
