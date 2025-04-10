'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Product } from '@/types';

interface SalesFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { productId: number; quantity: number; discount?: number }) => void;
  product: Product;
  productGroup: {
    productId: string;
    name: string;
    sku: string;
    variants: Product[];
    totalStock: number;
    latestSellingPrice: number;
  };
  isLoading?: boolean;
  availableStock: number;
}

export default function SalesFormModal({
  isOpen,
  onClose,
  onSave,
  product,
  productGroup,
  isLoading = false,
  availableStock,
}: SalesFormModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [maxQuantity, setMaxQuantity] = useState(availableStock);
  
  // Reset form when the modal opens with a new product
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setDiscount(0);
      setMaxQuantity(availableStock);
    }
  }, [isOpen, product, availableStock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate quantity
    if (quantity <= 0 || quantity > maxQuantity) {
      return;
    }
    
    onSave({
      productId: product.id,
      quantity,
      discount
    });
  };

  // Calculate subtotal
  const subtotal = quantity * productGroup.latestSellingPrice;
  const total = subtotal - discount;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Record Sale for {productGroup.name}
                </Dialog.Title>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    SKU: {productGroup.sku}
                  </p>
                  <p className="text-sm text-gray-500">
                    Available Stock: {maxQuantity}
                  </p>
                  <p className="text-sm text-gray-500">
                    Price: ₹{productGroup.latestSellingPrice.toFixed(2)}
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="1"
                      max={maxQuantity}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                    {quantity > maxQuantity && (
                      <p className="mt-1 text-sm text-red-600">
                        Cannot exceed available stock of {maxQuantity} units.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                      Discount
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        id="discount"
                        name="discount"
                        min="0"
                        max={subtotal}
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    {discount > subtotal && (
                      <p className="mt-1 text-sm text-red-600">
                        Discount cannot exceed subtotal.
                      </p>
                    )}
                  </div>
                  
                  {/* Summary */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-gray-900">-₹{discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mt-4 text-base font-medium">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 sm:mt-8 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={isLoading || quantity <= 0 || quantity > maxQuantity || discount > subtotal}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                    >
                      {isLoading ? 'Processing...' : 'Complete Sale'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 