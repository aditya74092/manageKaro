'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { products, transactions } from '@/lib/api';
import { Product, Transaction } from '@/types';
import Layout from '@/components/Layout';
import SalesFormModal from '@/components/SalesFormModal';
import { log } from 'console';

type ProductGroup = {
  productId: string;
  name: string;
  sku: string;
  variants: Product[];
  totalStock: number;
  latestSellingPrice: number;
  availableStock: number;
};

export default function SalesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState('');

  // Fetch products
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => products.getAll().then(res => res.data),
  });

  // Fetch transactions
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactions.getUserTransactions().then(res => res.data),
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: (data: { productId: number; quantity: number; discount?: number }) => 
      transactions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      setSelectedProduct(null);
    },
  });

  const handleCreateTransaction = (data: { productId: number; quantity: number; discount?: number }) => {
    createTransactionMutation.mutate(data);
  };

  // Filter products by name
  const filteredProducts = productsData ? 
    productsData.filter(product => 
      product.name.toLowerCase().includes(filter.toLowerCase()) ||
      product.sku.toLowerCase().includes(filter.toLowerCase())
    ) : [];

  // Group products by productId (SKU)
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.productId]) {
      acc[product.productId] = {
        productId: product.productId,
        name: product.name,
        sku: product.sku,
        variants: [],
        totalStock: 0,
        latestSellingPrice: 0,
        availableStock: 0
      };
    }
    
    // Add this variant
    acc[product.productId].variants.push(product);
    
    // Update total stock
    acc[product.productId].totalStock += product.stockQuantity;
    
    // Update latest price (most recent entry)
    const productDate = new Date(product.createdAt);
    const currentLatestDate = acc[product.productId].latestSellingPrice === 0 ? 
      new Date(0) : 
      new Date(acc[product.productId].variants.find(v => v.sellingPrice === acc[product.productId].latestSellingPrice)?.createdAt || 0);
    
    if (productDate > currentLatestDate) {
      acc[product.productId].latestSellingPrice = product.sellingPrice;
    }
    
    return acc;
  }, {} as Record<string, ProductGroup>);

  // Calculate sold quantities for each SKU
  const soldQuantities = transactionsData?.reduce((acc, transaction) => {
    const productId = transaction.productId.toString();
    console.log('productId',productId);
    console.log('acc',acc);
    if (!acc[productId]) {
      acc[productId] = 0;
    }
    acc[productId] += transaction.quantity;
    return acc;
  }, {} as Record<string, number>) || {};

  console.log('soldQuantities', soldQuantities);
  console.log('transactionsData', transactionsData);

  // Adjust available stock calculation
  const productList = Object.values(groupedProducts).map(productGroup => {
    console.log('productGroup',productGroup);
    const soldQuantity = soldQuantities[productGroup.productId] || 0;
    return {
      ...productGroup,
      availableStock: productGroup.totalStock - soldQuantity
    };
  });

  // Handler for opening the sales modal
  const handleSellClick = (productGroup: any) => {
    // Select the first product variant for reference
    setSelectedProduct(productGroup.variants[0]);
    setIsModalOpen(true);
  };

  console.log(transactionsData);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Sales</h1>
            <p className="mt-2 text-sm text-gray-700">Record new sales and view transaction history.</p>
          </div>
        </div>

        {/* Search Filter */}
        <div className="mb-6">
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search products by name or SKU"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {isLoadingProducts ? (
              <li className="px-6 py-4">Loading products...</li>
            ) : productList.length === 0 ? (
              <li className="px-6 py-4">No products found. Please add products first.</li>
            ) : (
              productList.map((productGroup) => (
                <li key={productGroup.productId} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{productGroup.name}</h3>
                    <div className="mt-1 text-sm text-gray-500">
                      <p>SKU: {productGroup.sku}</p>
                      <p>Available Stock: {productGroup.availableStock}</p>
                      <p>Price: ₹{productGroup.latestSellingPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSellClick(productGroup)}
                    disabled={productGroup.availableStock <= 0}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                      ${productGroup.availableStock <= 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                  >
                    Sell
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {isLoadingTransactions ? (
              <div className="px-6 py-4">Loading transactions...</div>
            ) : !transactionsData || transactionsData.length === 0 ? (
              <div className="px-6 py-4">No transactions recorded yet.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionsData?.map((transaction: Transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.product?.name || 'Unknown Product'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{transaction.sellingPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{transaction.discount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{((transaction.sellingPrice * transaction.quantity) - transaction.discount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sales Form Modal */}
        {selectedProduct && (
          <SalesFormModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedProduct(null);
            }}
            onSave={handleCreateTransaction}
            product={selectedProduct}
            isLoading={createTransactionMutation.isPending}
            productGroup={{
              ...groupedProducts[selectedProduct.productId],
              availableStock: productList.find(p => p.productId === selectedProduct.productId)?.availableStock || 0
            }}
          />
        )}
      </div>
    </Layout>
  );
} 