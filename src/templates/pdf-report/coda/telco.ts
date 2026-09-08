import { createColumnHelper, tableFeatures } from '@tanstack/table-core'

export interface CodaTelcoRow {
  nilaiTransaksi: number
  basicPrice: number
  diskonPenyedia: number
  codaSum: number
  jumlahTransaksi: number
  payoutToCoda: number
}

const features = tableFeatures({})
const column = createColumnHelper<typeof features, CodaTelcoRow>()

export const template = [
  column.accessor('nilaiTransaksi', {
    header: 'Nilai Transaksi',
    cell: (info) => info.getValue(),
  }),
  column.accessor('basicPrice', {
    header: 'Basic Price',
    cell: (info) => info.getValue(),
  }),
  column.accessor('diskonPenyedia', {
    header: 'Diskon Penyedia',
    cell: (info) => info.getValue(),
  }),

  column.accessor('codaSum', {
    header: 'Coda Sum',
    cell: (info) => info.getValue(),
  }),

  column.accessor('jumlahTransaksi', {
    header: 'Jumlah Transaksi',
    cell: (info) => info.getValue(),
  }),

  column.accessor('payoutToCoda', {
    header: 'Payout to Coda',
    cell: (info) => info.getValue(),
  }),
]
