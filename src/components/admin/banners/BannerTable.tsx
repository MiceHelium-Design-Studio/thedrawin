
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, EyeOff } from 'lucide-react';
import { Banner } from '@/types';
import BannerAction from './BannerAction';

interface BannerTableProps {
  banners: Banner[];
  onEdit: (banner: Banner) => void;
}

const BannerTable: React.FC<BannerTableProps> = ({ banners, onEdit }) => {
  const bannerTableColumns = [
    {
      accessorKey: 'imageUrl',
      header: 'Image',
      cell: ({ row }: { row: { original: Banner } }) => (
        <a href={row.original.imageUrl} target="_blank" rel="noopener noreferrer">
          <img src={row.original.imageUrl} alt="Banner" className="w-20 h-12 object-cover rounded" />
        </a>
      ),
    },
    {
      accessorKey: 'linkUrl',
      header: 'Link',
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
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          {bannerTableColumns.map((column) => (
            <TableHead key={column.accessorKey || column.id || column.header}>{column.header}</TableHead>
          ))}
        </TableHeader>
        <TableBody>
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
