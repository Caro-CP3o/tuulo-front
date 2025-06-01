export type MediaObjectType = {
  id: number;
  contentUrl: string;
};

export type FamilyMemberType = {
  id: number;
  role: string;
  familyId: number;
};

// export type PostType = {
//   id: number;
//   content: string;
//   createdAt: string;
// };
export type PostType = {
  id: number;
  title: string;
  content: string;
  image?: string | null;
  video?: string | null;
  createdAt: string; // ISO string format from Symfony
  updatedAt: string;
  author: {
    id: number;
    // Add any additional fields exposed on the User with 'user:read' group
    firstName?: string;
    lastName?: string;
    avatar?: string;
    color?: string;
  };
  family: {
    id: number;
    name: string;
    // Add any other fields exposed on the Family with 'post:read' group
  };
  postLikes: {
    id: number;
    // Add more fields if available in your PostLike serialization
  }[];
  postComments: {
    id: number;
    content: string;
    // Add more fields if available in your PostComment serialization
  }[];
};

export type PostLikeType = {
  id: number;
  postId: number;
};

export type PostCommentType = {
  id: number;
  content: string;
  createdAt: string;
};

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
};
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

