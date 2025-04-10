'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
  Row,
  Header,
  Cell,
} from '@tanstack/react-table';
import { suppliers } from '@/lib/api';
import { Supplier } from '@/types';
import Layout from '@/components/Layout';
import SupplierFormModal from '@/components/SupplierFormModal';

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: suppliersData, isLoading } = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: () => suppliers.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (newSupplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'products'>) => suppliers.create(newSupplier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error("Error creating supplier:", error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => suppliers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'contactInfo',
      header: 'Contact Info',
    },
    {
      id: 'actions',
      cell: ({ row }: { row: Row<Supplier> }) => (
        <button
          onClick={() => handleDelete(row.original.id)}
          className="text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: suppliersData ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSaveSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'products'>) => {
    createMutation.mutate(supplierData);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
            <p className="mt-2 text-sm text-gray-700">A list of all suppliers.</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Add Supplier
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header: Header<Supplier, unknown>) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 border-b border-gray-300 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row: Row<Supplier>) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell: Cell<Supplier, unknown>) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-no-wrap border-b border-gray-300"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSupplier}
        isLoading={createMutation.isPending}
      />
    </Layout>
  );
}