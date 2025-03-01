/**
 * GitHub OAuth user response type
 */
export type GitHubOAuthUser = {
  /** The user's GitHub username */
  login: string
  /** The user's unique GitHub ID */
  id: number
  /** The GraphQL node ID */
  node_id: string
  /** URL to the user's GitHub avatar */
  avatar_url: string
  /** Gravatar ID if applicable */
  gravatar_id: string
  /** API URL for the user */
  url: string
  /** Web URL to the user's GitHub profile */
  html_url: string
  /** API URL for the user's followers */
  followers_url: string
  /** API URL for the user's following */
  following_url: string
  /** API URL for the user's gists */
  gists_url: string
  /** API URL for the user's starred repositories */
  starred_url: string
  /** API URL for the user's subscriptions */
  subscriptions_url: string
  /** API URL for the user's organizations */
  organizations_url: string
  /** API URL for the user's repositories */
  repos_url: string
  /** API URL for the user's events */
  events_url: string
  /** API URL for events received by the user */
  received_events_url: string
  /** User type (usually 'User') */
  type: string
  /** User view type */
  user_view_type: string
  /** Whether the user is a GitHub site admin */
  site_admin: boolean
  /** The user's full name */
  name: string | null
  /** The user's company */
  company: string | null
  /** The user's blog or website */
  blog: string | null
  /** The user's location */
  location: string | null
  /** The user's public email */
  email: string | null
  /** Whether the user is available for hire */
  hireable: boolean | null
  /** The user's bio */
  bio: string | null
  /** The user's Twitter username */
  twitter_username: string | null
  /** The user's notification email */
  notification_email: string | null
  /** Number of public repositories */
  public_repos: number
  /** Number of public gists */
  public_gists: number
  /** Number of followers */
  followers: number
  /** Number of users the user is following */
  following: number
  /** Date when the account was created */
  created_at: string
  /** Date when the account was last updated */
  updated_at: string
}

/**
 * Google OAuth user response type
 */
export type GoogleOAuthUser = {
  /** The unique identifier for the user's Google account */
  sub: string
  /** The user's full name */
  name: string
  /** The user's first name */
  given_name: string
  /** The user's last name */
  family_name: string
  /** URL to the user's Google profile picture */
  picture: string
  /** The user's email address */
  email: string
  /** Whether the email has been verified by Google */
  email_verified: boolean
}

/**
 * X (Twitter) OAuth user response type
 */
export type XOAuthUser = {
  /** The user's X (Twitter) handle */
  username: string
  /** The user's unique X (Twitter) ID */
  id: string
  /** URL to the user's X (Twitter) profile picture */
  profile_image_url: string
  /** The type of verification the user has */
  verified_type: string
  /** The user's X (Twitter) bio/description */
  description: string
  /** The user's display name */
  name: string
  /** Whether the user is verified */
  verified: boolean
}
