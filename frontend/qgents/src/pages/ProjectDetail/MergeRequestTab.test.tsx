import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MergeRequestSummary } from '@/types/task-model'
import { MergeRequestTab } from './MergeRequestTab'

const useMergeRequestsMock = vi.hoisted(() => vi.fn())
const useTasksMock = vi.hoisted(() => vi.fn())
const useMergeMergeRequestMock = vi.hoisted(() => vi.fn())
const useRequestMergeRequestPreflightMock = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/task-model', () => ({
  useMergeRequests: useMergeRequestsMock,
  useTasks: useTasksMock,
  useMergeMergeRequest: useMergeMergeRequestMock,
  useRequestMergeRequestPreflight: useRequestMergeRequestPreflightMock,
}))

const items: MergeRequestSummary[] = [
  {
    id: 'mr-1',
    repositoryId: 'bound-demo-auth-service',
    groupIds: ['group-1'],
    provider: 'GITHUB',
    number: 42,
    title: '实现邮箱登录',
    sourceBranch: 'feat/login-api',
    targetBranch: 'main',
    status: 'OPEN',
    headCommit: 'abc123456789',
    webUrl: 'https://github.com/mock/demo/pull/42',
    qualityGate: { status: 'PENDING', requiredChecks: ['TESTSET'] },
    createMode: 'UNKNOWN',
  },
  {
    id: 'mr-2',
    repositoryId: 'bound-demo-web-console',
    groupIds: ['group-1'],
    provider: 'GITHUB',
    number: 18,
    title: '登录页接入',
    sourceBranch: 'feat/login-api',
    targetBranch: 'main',
    status: 'MERGED',
    headCommit: 'def456789012',
    webUrl: null,
    qualityGate: { status: 'PASSED', requiredChecks: ['TESTSET'] },
    createMode: 'UNKNOWN',
  },
]

function renderTab(path = '/code?tab=mr') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <MergeRequestTab
          projectId="demo-project"
          repositories={[
            {
              id: 'bound-demo-auth-service',
              repositoryId: 'repo-2',
              installationId: 'install-1',
              providerRepositoryId: 1,
              fullName: 'mock/auth-service',
              githubUrl: 'https://github.com/mock/auth-service',
              displayName: 'auth-service',
              defaultBranch: 'main',
              authorizationStatus: 'AUTHORIZED',
              metadataSyncedAt: '2026-08-15T00:00:00Z',
              boundAt: '2026-08-15T00:00:00Z',
            },
            {
              id: 'bound-demo-web-console',
              repositoryId: 'repo-3',
              installationId: 'install-1',
              providerRepositoryId: 2,
              fullName: 'mock/web-console',
              githubUrl: 'https://github.com/mock/web-console',
              displayName: 'web-console',
              defaultBranch: 'main',
              authorizationStatus: 'AUTHORIZED',
              metadataSyncedAt: '2026-08-15T00:00:00Z',
              boundAt: '2026-08-15T00:00:00Z',
            },
          ]}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  useMergeRequestsMock.mockReturnValue({
    data: { data: items, page: { nextCursor: null, hasMore: false }, requestId: 'r1' },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  useTasksMock.mockReturnValue({
    data: { data: [], page: { nextCursor: null, hasMore: false }, requestId: 'r1' },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  useMergeMergeRequestMock.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  })
  useRequestMergeRequestPreflightMock.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  })
})

describe('MergeRequestTab', () => {
  it('loads merge requests through the documented list hook', () => {
    renderTab()
    expect(useMergeRequestsMock).toHaveBeenCalledWith('demo-project', {
      repositoryId: undefined,
      status: undefined,
      limit: 50,
    })
    expect(screen.getByText('实现邮箱登录')).toBeInTheDocument()
    expect(screen.getByText('auth-service')).toBeInTheDocument()
    const githubLinks = screen.getAllByRole('link', { name: 'GitHub' })
    expect(githubLinks).toHaveLength(2)
    expect(githubLinks[0]).toHaveAttribute('href', 'https://github.com/mock/demo/pull/42')
    expect(githubLinks[1]).toHaveAttribute('href', 'https://github.com/mock/web-console/pull/18')
  })

  it('forwards repository and status filters from the query string', () => {
    renderTab('/code?tab=mr&repositoryId=bound-demo-auth-service&status=OPEN')
    expect(useMergeRequestsMock).toHaveBeenCalledWith('demo-project', {
      repositoryId: 'bound-demo-auth-service',
      status: 'OPEN',
      limit: 50,
    })
  })

  it('renders a temporary row while an MR_FIRST task is still delivering', () => {
    useMergeRequestsMock.mockReturnValue({
      data: { data: [], page: { nextCursor: null, hasMore: false }, requestId: 'r2' },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    useTasksMock.mockReturnValue({
      data: {
        data: [{
          id: 'task-delivering',
          displayCode: 'T-100',
          projectId: 'demo-project',
          title: '交付中的大功能',
          requirementSummary: '交付中的大功能',
          status: 'DELIVERING',
          deliveryMode: 'MR_FIRST',
          deliveryReason: null,
          requirementGroup: null,
          createdByUser: null,
          repositories: [{
            repositoryId: 'bound-demo-auth-service',
            name: 'auth-service',
            fullName: 'mock/auth-service',
            provider: 'GITHUB',
            defaultBranch: 'main',
            baseRef: 'main',
            baseCommit: 'base-commit',
            sourceBranch: 'feat/task-delivering',
            headCommit: null,
          }],
          executionSummary: {
            totalSteps: 1,
            pendingSteps: 0,
            runningSteps: 1,
            waitingSteps: 0,
            blockedSteps: 0,
            succeededSteps: 0,
            failedSteps: 0,
            currentStage: 'DEVELOPER',
            currentStageTitle: '代码交付中',
            requiresUserAction: false,
          },
          attention: null,
          statusReason: null,
          createdAt: '2026-08-21T00:00:00Z',
          updatedAt: '2026-08-21T00:00:00Z',
        }],
        page: { nextCursor: null, hasMore: false },
        requestId: 'r2',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    renderTab()

    expect(screen.getAllByText('交付中的大功能')).not.toHaveLength(0)
    expect(screen.getByText('交付中')).toBeInTheDocument()
    expect(screen.getByText('代码推送中')).toBeInTheDocument()
    expect(screen.getAllByText('等待推送')).not.toHaveLength(0)
  })
})
