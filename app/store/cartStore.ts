import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, createCart, addToCart, removeFromCart, updateCartLine, getCart } from '@/lib/shopify';

interface CartState {
  cartId: string | null;
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      cart: null,
      isOpen: false,
      isLoading: false,

      initialize: async () => {
        const { cartId } = get();
        if (cartId) {
          try {
            set({ isLoading: true });
            const cart = await getCart(cartId);
            if (cart) {
              set({ cart });
            } else {
              // Cart ID 過期或無效，重置
              set({ cartId: null, cart: null });
            }
          } catch (error) {
            console.error('Failed to fetch cart:', error);
            set({ cartId: null, cart: null });
          } finally {
            set({ isLoading: false });
          }
        }
      },

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: async (variantId, quantity = 1) => {
        let { cartId } = get();
        set({ isLoading: true, isOpen: true }); // 自動開啟視窗

        try {
          // 1. 若無購物車，先建立
          if (!cartId) {
            const newCart = await createCart();
            cartId = newCart.id;
            set({ cartId, cart: newCart });
          }

          // 2. 加入商品
          const updatedCart = await addToCart(cartId!, [{ merchandiseId: variantId, quantity }]);
          set({ cart: updatedCart });
        } catch (error) {
          console.error('Failed to add item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (lineId) => {
        const { cartId } = get();
        if (!cartId) return;

        set({ isLoading: true });
        try {
          const updatedCart = await removeFromCart(cartId, [lineId]);
          set({ cart: updatedCart });
        } catch (error) {
          console.error('Failed to remove item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (lineId, quantity) => {
        const { cartId } = get();
        if (!cartId) return;

        set({ isLoading: true });
        try {
          const updatedCart = await updateCartLine(cartId, [{ id: lineId, quantity }]);
          set({ cart: updatedCart });
        } catch (error) {
          console.error('Failed to update quantity:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'headless-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cartId: state.cartId }), // 只持久化 cartId
    }
  )
);