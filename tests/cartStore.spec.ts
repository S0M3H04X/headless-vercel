import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore } from '@/store/cartStore';
import * as shopifyApi from '@/lib/shopify';

// 1. Mock Shopify API 模組
vi.mock('@/lib/shopify', () => ({
  createCart: vi.fn(),
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  updateCartLine: vi.fn(),
  getCart: vi.fn(),
}));

describe('CartStore', () => {
  beforeEach(() => {
    // 重置 Store 狀態
    useCartStore.setState({
      cartId: null,
      cart: null,
      isOpen: false,
      isLoading: false,
      error: null
    });
    // 清除 Mock 紀錄
    vi.clearAllMocks();
  });

  it('should initialize correctly', () => {
    const state = useCartStore.getState();
    expect(state.cart).toBeNull();
    expect(state.cartId).toBeNull();
    expect(state.isOpen).toBe(false);
  });

  it('should create a new cart and add item if cartId does not exist', async () => {
    // Setup Mocks
    const mockCart = { id: 'new-cart-id', lines: { edges: [] } };
    const mockUpdatedCart = { 
        id: 'new-cart-id', 
        lines: { edges: [{ node: { id: 'line-1', quantity: 1 } }] } 
    };

    (shopifyApi.createCart as any).mockResolvedValue(mockCart);
    (shopifyApi.addToCart as any).mockResolvedValue(mockUpdatedCart);

    // Execute Action
    await useCartStore.getState().addItem('variant-123', 1);

    // Assertions
    const state = useCartStore.getState();
    expect(shopifyApi.createCart).toHaveBeenCalled(); // 應該呼叫建立購物車
    expect(shopifyApi.addToCart).toHaveBeenCalledWith('new-cart-id', [{ merchandiseId: 'variant-123', quantity: 1 }]);
    expect(state.cartId).toBe('new-cart-id');
    expect(state.cart).toEqual(mockUpdatedCart);
    expect(state.isOpen).toBe(true); // 自動開啟視窗
  });

  it('should handle errors gracefully', async () => {
    // Setup Mock to fail
    (shopifyApi.createCart as any).mockRejectedValue(new Error('Network Error'));

    // Execute
    await useCartStore.getState().addItem('variant-123');

    // Assert
    const state = useCartStore.getState();
    expect(state.error).toContain('Could not add item');
    expect(state.isLoading).toBe(false);
  });
});