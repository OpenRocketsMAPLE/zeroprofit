// React binding for the local store: `useApp()` exposes live state + actions.
// No provider needed — the store itself is the single source of truth and
// `useSyncExternalStore` keeps every consumer in sync.

import { useSyncExternalStore } from 'react';
import { getState, subscribe } from './store';
import type { PersistedState } from '../types';

import {
  addDomain,
  addLink,
  addMember,
  addProject,
  addWaitlist,
  addWidget,
  appendScoreRow,
  checkDomains,
  closeOrg,
  connectNetlifyDemo,
  createOrg,
  disconnectNetlify,
  recordLinkClick,
  removeDomain,
  removeLink,
  removeMember,
  removeProject,
  removeWidget,
  resetDemo,
  revokeInvite,
  setMemberRole,
  setProfileFlag,
  signIn,
  signOut,
  submitVerification,
  syncNetlifySites,
  transferOwnership,
  triggerDeploy,
  updateAccountProfile,
  updateLink,
  updateOrg,
  updateWidget,
} from './store';

export interface AppApi {
  state: PersistedState;
  addDomain: typeof addDomain;
  addLink: typeof addLink;
  addMember: typeof addMember;
  addProject: typeof addProject;
  addWaitlist: typeof addWaitlist;
  addWidget: typeof addWidget;
  appendScoreRow: typeof appendScoreRow;
  checkDomains: typeof checkDomains;
  closeOrg: typeof closeOrg;
  connectNetlifyDemo: typeof connectNetlifyDemo;
  createOrg: typeof createOrg;
  disconnectNetlify: typeof disconnectNetlify;
  recordLinkClick: typeof recordLinkClick;
  removeDomain: typeof removeDomain;
  removeLink: typeof removeLink;
  removeMember: typeof removeMember;
  removeProject: typeof removeProject;
  removeWidget: typeof removeWidget;
  resetDemo: typeof resetDemo;
  revokeInvite: typeof revokeInvite;
  setMemberRole: typeof setMemberRole;
  setProfileFlag: typeof setProfileFlag;
  signIn: typeof signIn;
  signOut: typeof signOut;
  submitVerification: typeof submitVerification;
  syncNetlifySites: typeof syncNetlifySites;
  transferOwnership: typeof transferOwnership;
  triggerDeploy: typeof triggerDeploy;
  updateAccountProfile: typeof updateAccountProfile;
  updateLink: typeof updateLink;
  updateOrg: typeof updateOrg;
  updateWidget: typeof updateWidget;
}

export function useApp(): AppApi {
  const state = useSyncExternalStore(subscribe, getState);
  return {
    state,
    addDomain,
    addLink,
    addMember,
    addProject,
    addWaitlist,
    addWidget,
    appendScoreRow,
    checkDomains,
    closeOrg,
    connectNetlifyDemo,
    createOrg,
    disconnectNetlify,
    recordLinkClick,
    removeDomain,
    removeLink,
    removeMember,
    removeProject,
    removeWidget,
    resetDemo,
    revokeInvite,
    setMemberRole,
    setProfileFlag,
    signIn,
    signOut,
    submitVerification,
    syncNetlifySites,
    transferOwnership,
    triggerDeploy,
    updateAccountProfile,
    updateLink,
    updateOrg,
    updateWidget,
  };
}
