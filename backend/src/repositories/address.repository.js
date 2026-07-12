// Address repository — every Prisma query involving the Address model
// lives here. `create` takes an optional Prisma client so order creation
// can run it inside a transaction (see order.service.js) while still
// working standalone if a future address-book feature needs it outside one.
//
// No findAll/update/delete yet — this phase only ever creates a fresh
// address per order (see the cart/orders backend plan for why: no saved
// address book in this phase).

import prisma from "../config/prisma.js";

export const addressRepository = {
  create(data, client = prisma) {
    return client.address.create({ data });
  },
};
