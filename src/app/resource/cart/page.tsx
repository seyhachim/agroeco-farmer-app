"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaTrashAlt } from "react-icons/fa";
import { useCart } from "../../../components/Marketplace/context";
import { marketplaceApi, Product } from "../../../lib/api/marketplaceApi";

const CartPage: React.FC = () => {
  const router = useRouter();
  const { cartIds, removeFromCart, clearCart } = useCart();
  const [cartProducts, setCartProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadCartProducts();
  }, [cartIds]);

  const loadCartProducts = async () => {
    if (cartIds.length === 0) {
      setCartProducts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const products = await Promise.all(
        cartIds.map((id) => marketplaceApi.getProductById(id))
      );
      setCartProducts(products.filter(Boolean) as Product[]);
    } catch (error) {
      console.error("Error loading cart products:", error);
      setCartProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header Skeleton */}
      <div className="relative flex items-center p-4 sm:p-6 border-b border-gray-200">
        <div className="w-6 h-6 bg-gray-300 rounded"></div>
        <div className="absolute left-1/2 transform -translate-x-1/2 w-32 h-4 bg-gray-300 rounded"></div>
        <div className="absolute right-4 w-16 h-4 bg-gray-300 rounded"></div>
      </div>

      <div className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 gap-8">
        {/* Cart Items Skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center border rounded-lg p-3 bg-gray-50 animate-pulse"
            >
              <div className="w-20 h-20 bg-gray-300 rounded-md"></div>
              <div className="flex-1 ml-4 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-5 bg-gray-300 rounded w-16"></div>
                <div className="h-3 bg-gray-300 rounded w-12"></div>
              </div>
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>

        {/* Order Summary Skeleton */}
        <div className="w-full lg:w-96 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 mt-4 flex justify-between">
            <div className="h-5 bg-gray-300 rounded w-16"></div>
            <div className="h-5 bg-gray-300 rounded w-20"></div>
          </div>
          <div className="w-full h-12 bg-gray-300 rounded-lg mt-6"></div>
        </div>
      </div>
    </div>
  );

  // Calculate totals
  const subtotal = cartProducts.reduce((sum, p) => sum + (p.price || 0), 0);
  const shipping = cartProducts.length > 0 ? 5.0 : 0;
  const taxRate = 0.07;
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (cartProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center font-[Rubik]">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-gray-500 mb-6 max-w-md">
          Looks like you have not added any items to your cart yet. Start
          shopping to discover amazing products!
        </p>
        <button
          onClick={() => router.push("/resource")}
          className="bg-[#0E4123] text-white px-8 py-3 rounded-lg hover:bg-green-800 transition font-medium"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative flex items-center p-4 sm:p-6 border-b border-gray-200 bg-white">
        <button
          onClick={() => router.back()}
          className="z-10 p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Go back"
        >
          <FaChevronLeft className="text-xl text-gray-700" />
        </button>
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-[#0D1B2A] text-base font-[Rubik] leading-4 tracking-[0.2px] text-center">
          Shopping Cart
        </h1>
        {cartProducts.length > 0 && (
          <button
            onClick={clearCart}
            className="absolute right-4 text-red-600 hover:text-red-700 cursor-pointer text-sm font-[Rubik] font-medium transition"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 gap-8 flex-1">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 font-[Rubik]">
              Cart Items ({cartProducts.length})
            </h2>
            <span className="text-sm text-gray-500 font-[Rubik]">
              Total: ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="space-y-4">
            {cartProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow font-[Rubik]"
              >
                {/* Product Image */}
                <img
                  src={
                    product.images[0] || "/icons/marketplace/placeholder.svg"
                  }
                  alt={product.title}
                  width={96}
                  height={96}
                  className="rounded-lg object-cover shrink-0"
                />

                {/* Product Details */}
                <div className="flex-1 ml-4 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                    {product.title}
                  </h3>
                  <p className="text-[#0E4123] text-xl font-bold">
                    ${product.price?.toFixed(2) || "0.00"}
                  </p>
                  {product.old_price &&
                    product.old_price > (product.price || 0) && (
                      <p className="text-gray-500 text-sm line-through">
                        ${product.old_price.toFixed(2)}
                      </p>
                    )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="text-red-500 hover:text-red-700 p-3 hover:bg-red-50 rounded-lg transition shrink-0"
                  aria-label={`Remove ${product.title} from cart`}
                >
                  <FaTrashAlt className="text-lg" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 bg-white p-6 rounded-lg shadow-lg border border-gray-200 sticky top-4 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-6 font-[Rubik]">
            Order Summary
          </h2>

          <div className="space-y-4 text-sm font-[Rubik] mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Subtotal ({cartProducts.length} items)
              </span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Tax</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t pt-4 flex justify-between items-center text-lg font-bold font-[Rubik] mb-6">
            <span>Total</span>
            <span className="text-[#0E4123]">${total.toFixed(2)}</span>
          </div>

          <button className="w-full bg-[#0E4123] text-white py-4 rounded-lg text-lg font-semibold hover:bg-green-800 transition font-[Rubik]">
            Proceed to Checkout
          </button>

          <p className="text-xs text-gray-500 text-center mt-4 font-[Rubik]">
            Free shipping on orders over $50
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
