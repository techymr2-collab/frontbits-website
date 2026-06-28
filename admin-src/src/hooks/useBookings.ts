import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as bookingsApi from '@/api/bookings'
import type { BookingUpdate } from '@/api/bookings'
import { queryKeys } from '@/lib/queryKeys'

export function useBookings() {
  return useQuery({ queryKey: queryKeys.bookings.list, queryFn: bookingsApi.listBookings })
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id ?? ''),
    queryFn: () => bookingsApi.getBooking(id as string),
    enabled: Boolean(id),
  })
}

export function useUpdateBooking(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BookingUpdate) => bookingsApi.updateBooking(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.list })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) })
    },
  })
}
