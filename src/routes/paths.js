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
    dashboard: "/admin/dashboard",
    products: "/admin/products",
    newProduct: "/admin/products/new",
    editProductPath: "/admin/products/:id/edit",
    editProduct: (id) => `/admin/products/${id}/edit`,
    orders: "/admin/orders",
    orderDetailPath: "/admin/orders/:id",
    orderDetail: (id) => `/admin/orders/${id}`,
    customers: "/admin/customers",
    customerDetailPath: "/admin/customers/:id",
    customerDetail: (id) => `/admin/customers/${id}`,
    reviews: "/admin/reviews",
  },
};
