// Newsletter service — business logic only, mirrors the layering
// established by every other service in this app.

import { newsletterRepository } from "../repositories/newsletter.repository.js";

export const newsletterService = {
  subscribe(email) {
    return newsletterRepository.subscribe(email);
  },

  listForAdmin({ page, pageSize, search }) {
    return newsletterRepository.findAllForAdmin({ page, pageSize, search });
  },
};
