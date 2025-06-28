// ---------------------------
// USER TYPE
// ---------------------------
export type UserType = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  alias?: string;
  birthDate: string;
  avatar?: MediaObjectType;
  color: string;
  slug: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  familyMembers: FamilyMemberType[];
  posts: PostType[];
  postLikes: PostLikeType[];
  postComments: PostCommentType[];
  isVerified: boolean;
  registrationStep?: string;
  emailVerificationExpiresAt?: string;
  invitationCode?: string;
};
// ---------------------------
// FAMILY TYPE
// ---------------------------
export type FamilyType = {
  id: number;
  name: string;
  description?: string;
  coverImage?: MediaObjectType;
  creator: UserType;
  members: FamilyMemberType[];
  createdAt: string;
  updatedAt: string;
};
// ---------------------------
// FAMILYMEMBER TYPE
// ---------------------------
export type FamilyMemberType = {
  id: number;
  email?: string;
  status: 'pending' | 'active' | 'rejected';
  joinedAt: string;
  familyId: number;
  userId: number;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    alias?: string;
    avatar?: { contentUrl: string };
    color: string;
    roles: string[];
  }
};
// ---------------------------
// POST TYPE
// ---------------------------
export type PostType = {
  id: number;
  title: string;
  content: string;
  image?: { contentUrl: string; "@id": string; };
  video?: { contentUrl: string; "@id": string; };
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    firstName?: string;
    lastName?: string;
    alias?: string;
    avatar?: { contentUrl: string };
    color: string;
  };
  family: {
    id: number;
    name: string;
  };
  postLikes: {
    user: UserType;
    id: number;
  }[];
  postComments: {
    id: number;
    content: string;
  }[];
};
// ---------------------------
// POSTLIKE TYPE
// ---------------------------
export type PostLikeType = {
  id: number;
  postId: number;
  user: {
    id: number;
  };
};
// ---------------------------
// POSTCOMMENT TYPE
// ---------------------------
export type PostCommentType = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    alias?: string;
    avatar?: { contentUrl: string };
    color: string;
  };
  parent?: {
    id: number;
  } | null;
  replies?: PostCommentType[];
};
// ---------------------------
// MEDIAOBJECT TYPE
// ---------------------------
export type MediaObjectType = {
  id: number;
  contentUrl: string;
};