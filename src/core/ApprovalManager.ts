/**
 * Approval Manager - handles approval workflow
 */

import { ApprovalRequest, Task } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ApprovalManager {
  private approvalRequests: Map<string, ApprovalRequest> = new Map();
  private approvalCallbacks: Map<string, (approved: boolean) => void> = new Map();

  requestApproval(task: Task, reason: string): Promise<boolean> {
    const request: ApprovalRequest = {
      id: uuidv4(),
      taskId: task.id,
      reason,
      requestedAt: new Date()
    };

    this.approvalRequests.set(request.id, request);

    return new Promise((resolve) => {
      this.approvalCallbacks.set(request.id, (approved: boolean) => {
        resolve(approved);
      });
    });
  }

  approveRequest(requestId: string): void {
    const request = this.approvalRequests.get(requestId);
    if (request) {
      request.approved = true;
      request.approvedAt = new Date();
      
      const callback = this.approvalCallbacks.get(requestId);
      if (callback) {
        callback(true);
        this.approvalCallbacks.delete(requestId);
      }
    }
  }

  rejectRequest(requestId: string): void {
    const request = this.approvalRequests.get(requestId);
    if (request) {
      request.approved = false;
      request.rejectedAt = new Date();
      
      const callback = this.approvalCallbacks.get(requestId);
      if (callback) {
        callback(false);
        this.approvalCallbacks.delete(requestId);
      }
    }
  }

  getPendingApprovals(): ApprovalRequest[] {
    return Array.from(this.approvalRequests.values())
      .filter(req => req.approved === undefined);
  }

  getApprovalRequest(requestId: string): ApprovalRequest | undefined {
    return this.approvalRequests.get(requestId);
  }

  getApprovalsByTask(taskId: string): ApprovalRequest[] {
    return Array.from(this.approvalRequests.values())
      .filter(req => req.taskId === taskId);
  }
}
