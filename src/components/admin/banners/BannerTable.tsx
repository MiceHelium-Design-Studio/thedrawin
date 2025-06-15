
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Banner } from '@/types';
import BannerAction from './BannerAction';

interface BannerTableProps {
  banners: Banner[];
  onEdit: (banner: Banner) => void;
}

const BannerTable: React.FC<BannerTableProps> = ({ banners, onEdit }) => {
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (banner: Banner) => {
    setLoadErrors(prev => ({
      ...prev,
      [banner.id]: true
    }));
    console.error(`Failed to load banner image: ${banner.imageUrl}`);
  };
  
  const bannerTableColumns = [
    {
      accessorKey: 'imageUrl',
      header: 'Image',
      cell: ({ row }: { row: { original: Banner } }) => {
        const banner = row.original;
        const hasError = loadErrors[banner.id];
        
        return (
          <div className="relative w-20 h-12">
            <a 
              href={banner.imageUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={hasError ? "cursor-not-allowed" : ""}
              onClick={e => {
                if (hasError) e.preventDefault();
              }}
            >
              <img 
                src={hasError ? "/placeholder.svg" : banner.imageUrl} 
                alt={hasError ? "Failed to load" : "Banner"} 
                className={`w-20 h-12 object-cover rounded ${hasError ? 'opacity-50' : ''}`}
                onError={() => handleImageError(banner)}
              />
              {hasError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/70 text-white text-xs p-1 rounded flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1 text-red-400" />
                    Error
                  </div>
                </div>
              )}
            </a>
          </div>
        );
      },
    },
    {
      accessorKey: 'linkUrl',
      header: 'Link',
      cell: ({ row }: { row: { original: Banner } }) => (
        <div className="max-w-[200px] truncate">
          <a 
            href={row.original.linkUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#F39C0A] hover:underline"
          >
            {row.original.linkUrl}
          </a>
        </div>
      ),
    },
    {
      accessorKey: 'active',
      header: 'Active',
      cell: ({ row }: { row: { original: Banner } }) => (
        row.original.active ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-red-500" />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: Banner } }) => (
        <BannerAction banner={row.original} onEdit={onEdit} />
      )
    }
  ];

  return (
    <div className="rounded-md border border-white/20 overflow-x-auto">
      <Table>
        <TableHeader>
          {bannerTableColumns.map((column) => (
            <TableHead key={column.accessorKey || column.id || column.header}>{column.header}</TableHead>
          ))}
        </TableHeader>
        <TableBody>
          {banners.length === 0 && (
            <TableRow>
              <TableCell colSpan={bannerTableColumns.length} className="h-24 text-center">
                No banners found. Create a new banner to get started.
              </TableCell>
            </TableRow>
          )}
          {banners.map((banner) => (
            <TableRow key={banner.id}>
              {bannerTableColumns.map((column) => {
                const key = column.accessorKey || column.id || column.header;
                const value = column.cell
                  ? column.cell({ row: { original: banner } })
                  : banner[column.accessorKey as keyof Banner];
                return <TableCell key={key}>{value}</TableCell>;
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BannerTable;
