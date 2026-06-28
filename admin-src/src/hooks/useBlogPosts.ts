import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as blogPostsApi from '@/api/blogPosts'
import type { BlogPostInsert, BlogPostUpdate } from '@/api/blogPosts'
import { queryKeys } from '@/lib/queryKeys'

export function useBlogPosts() {
  return useQuery({ queryKey: queryKeys.blogPosts.list, queryFn: blogPostsApi.listBlogPosts })
}

export function useBlogPost(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.blogPosts.detail(id ?? ''),
    queryFn: () => blogPostsApi.getBlogPost(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BlogPostInsert) => blogPostsApi.createBlogPost(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.blogPosts.list }),
  })
}

export function useUpdateBlogPost(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BlogPostUpdate) => blogPostsApi.updateBlogPost(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogPosts.list })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogPosts.detail(id) })
    },
  })
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => blogPostsApi.deleteBlogPost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.blogPosts.list }),
  })
}
