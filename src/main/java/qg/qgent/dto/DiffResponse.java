package qg.qgent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Diff 详情响应：变更统计与关联提交，以及产出它的 Task/TaskRun/TaskStep 归属。
 * 验收结果通过 status（PENDING_REVIEW/ACCEPTED/REJECTED）与 reviewedBy/reviewReason/reviewedAt 表达。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiffResponse {
    private String id;
    private String projectId;
    private String taskId;
    private String taskRunId;
    private String taskStepId;
    private String requirementGroupId;
    private String workspaceId;
    private String repositoryId;
    private String baseCommit;
    private String sourceBranch;
    private String workingTreeHash;
    private String snapshotKey;
    private String headCommit;
    private String status;
    private String reviewedBy;
    private String reviewReason;
    private String reviewedAt;
    private Map<String, Object> changeStats;
    private String createdAt;
    private String updatedAt;
}
