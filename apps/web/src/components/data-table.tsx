// oxlint-disable unicorn/no-nested-ternary

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@rozumari/ui/components/pagination'
import { Skeleton } from '@rozumari/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@rozumari/ui/components/table'

export interface DataTableProps<TData> {
  data: readonly TData[] | TData[]
  keyExtractor: (item: TData) => string
  columns: Partial<
    Record<
      keyof TData | '_',
      { header: string; action: (item: TData) => React.ReactNode } | string
    >
  >

  isLoading?: boolean

  page?: number
  pageSize?: number
  totalPages?: number
  setPage?: (page: number) => void
}

export function DataTable<TData>(props: DataTableProps<TData>) {
  const { data, keyExtractor, columns, isLoading = false } = props
  const { page, pageSize, totalPages, setPage } = props

  const activeKeys = Object.keys(columns) as (keyof TData)[]

  const getHeaderLabel = (key: keyof TData): string => {
    const config = columns[key]

    if (typeof config === 'string') return config
    if (typeof config === 'object' && config?.header) return config.header
    return String(key)
  }

  const renderCell = (item: TData, key: keyof TData): React.ReactNode => {
    const config = columns[key]

    if (typeof config === 'object' && config?.action) return config.action(item)
    return String(item[key] ?? '')
  }

  const showPagination =
    page !== undefined && totalPages !== undefined && setPage !== undefined

  return (
    <Table className='rounded-lg bg-card'>
      <TableHeader>
        <TableRow>
          {activeKeys.map((key) => (
            <TableHead key={String(key)}>{getHeaderLabel(key)}</TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading ? (
          Array.from({ length: pageSize ?? 1 }, (_, index) => (
            <TableRow key={index}>
              {Array.from({ length: activeKeys.length ?? 1 }, (__, idx) => (
                <TableCell key={idx}>
                  <Skeleton>&nbsp;</Skeleton>
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={activeKeys.length ?? 1} className='text-center'>
              No data available
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={keyExtractor(item)}>
              {activeKeys.map((key) => (
                <TableCell key={`${keyExtractor(item)}-${String(key)}`}>
                  {renderCell(item, key)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>

      {showPagination && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={activeKeys.length || 1}>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-muted-foreground'>
                  Page <strong>{page}</strong> of{' '}
                  <strong>{totalPages || 1}</strong>
                </span>

                <Pagination className='m-0 w-auto'>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={(e) => {
                          e.preventDefault()
                          if (page > 1) setPage(page - 1)
                        }}
                        aria-disabled={page <= 1}
                        className={
                          page <= 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        onClick={(e) => {
                          e.preventDefault()
                          if (page < totalPages) setPage(page + 1)
                        }}
                        aria-disabled={page >= totalPages}
                        className={
                          page >= totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  )
}
