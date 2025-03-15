import { Pagination, PaginationContent,PaginationEllipsis,PaginationItem, PaginationNext,PaginationPrevious } from "@/components/ui/pagination"
import { useSearchParams } from "react-router-dom"
import { Button } from "../ui/button"

export default function CustomPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  const [searchParams, setSearchParams] = useSearchParams()
    const handleSetPage = (page: number) => {
      searchParams.set("page", String(page))
      setSearchParams(searchParams)
    }
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem >
            <Button disabled={currentPage === 1} onClick={() => handleSetPage(currentPage - 1)}>
              <PaginationPrevious />
            </Button>
          </PaginationItem>
          {Array.from({ length: Math.min(totalPages - currentPage + 1, 5) }, (_, index) => index).map((page) => (
            <PaginationItem key={currentPage + page}>
              <Button
                onClick={() => handleSetPage(currentPage + page)}
                className={`${currentPage + page === currentPage ? "bg-slate-400" : "bg-slate-100"}`}
              >
                {currentPage + page}
              </Button>
            </PaginationItem>
          ))}
          <PaginationItem>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => handleSetPage(totalPages)}
              className="bg-slate-100"
            >
              <PaginationEllipsis />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button disabled={currentPage >= totalPages} onClick={() => handleSetPage(currentPage + 1)}>
              <PaginationNext />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
}
