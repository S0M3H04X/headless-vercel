import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, createCart, addToCart, removeFromCart, updateCartLine, getCart, updateCartBuyerIdentity } from '@/lib/shopify';
import { error } from 'node:console';

interface CartState {
  cartId: string | null;
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  associateUser: (accessToken: string | null, email?: string) => Promise<void>;

  // Actions
  initialize: () => Promise<void>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;

  clearError: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      cart: null,
      isOpen: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      initialize: async () => {
        const { cartId } = get();
        if (cartId) {
          try {
            set({ isLoading: true, error: null });
            const cart = await getCart(cartId);
            if (cart && cart.lines) {
              set({ cart });
            } else {
              // Cart ID 過期、無效或資料結構不完整 (missing lines)，重置
              set({ cartId: null, cart: null });
            }
          } catch (error) {
            console.error('Failed to fetch cart:', error);
            set({ error: 'Failed to load cart. Please try again.' });
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
        set({ isLoading: true, isOpen: true, error: null }); // 自動開啟視窗

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
          set({ error: 'Could not add item to cart.' });
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
          set({ error: 'Failed to remove item.' });
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
          set({ error: 'Failed to update quantity.' });
        } finally {
          set({ isLoading: false });
        }
      },
      // [核心實作] US-08-02: 身份綁定
      associateUser: async (accessToken, email) => {
        const { cartId } = get();

        // 情況 A: 目前沒有購物車 (因為訪客不能購物)
        // 策略: 暫不動作，等到使用者真的 addItem 時，我們再帶入 Token (需修改 addItem)
        // 或者: 在此直接建立一個帶有 Identity 的空購物車 (推薦，為了 UX 順暢)

        if (!cartId || !email) {
          // 可選：預先建立購物車邏輯，或單純將 Token 存入 store 等待下次使用
          // 這裡示範「若有車則綁定，若無車則 pass」的保守策略
          return;
        }

        // 情況 B: 已有購物車 (可能是舊 Session 殘留)
        // 執行綁定
        set({ isLoading: true });
        try {
          console.log('[Cart] Binding identity to cart...');
          const updatedCart = await updateCartBuyerIdentity(cartId, {
            customerAccessToken: accessToken || undefined,
            email: email
          });

          if (updatedCart) {
            set({ cart: updatedCart });
          }
        } catch (error) {
          console.error('[Cart] Association failed:', error);
          // 如果 Token 失效 (Customer is invalid)，可能需要通知 AuthStore 登出
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