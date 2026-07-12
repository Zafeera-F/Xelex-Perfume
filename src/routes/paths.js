// Single source of truth for every URL in the app.
// Components import PATHS instead of hardcoding path strings.

export const PATHS = {
  home: "/",
  shop: "/shop",
  product: "/product/:productId",
  productLink: (id) => `/product/${id}`,
  cart: "/cart",
  checkout: "/checkout",
  wishlist: "/wishlist",
  about: "/about",
  contact: "/contact",
  login: "/login",
  register: "/register",
  profile: "/account",
  admin: {
    root: "/admin",
    login: "/admin/login",
    products: "/admin/products",
    newProduct: "/admin/products/new",
    editProductPath: "/admin/products/:id/edit",
    editProduct: (id) => `/admin/products/${id}/edit`,
    orders: "/admin/orders",
    orderDetailPath: "/admin/orders/:id",
    orderDetail: (id) => `/admin/orders/${id}`,
    reviews: "/admin/reviews",
  },
};
