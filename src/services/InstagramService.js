import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

class InstagramService {
  constructor() {
    this.appId = process.env.FACEBOOK_APP_ID;
    this.appSecret = process.env.FACEBOOK_APP_SECRET;
    this.redirectUri = process.env.FACEBOOK_REDIRECT_URI;
    this.graphApiUrl = "https://graph.facebook.com/v18.0";
  }

  /**
   * Generate Facebook Login URL for Instagram
   */
  getAuthUrl() {
    const scopes = [
      "public_profile",
      "pages_show_list",
      "instagram_basic",
      "instagram_manage_insights",
      "pages_read_engagement",
    ].join(",");

    return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${this.appId}&redirect_uri=${this.redirectUri}&scope=${scopes}&response_type=code`;
  }

  /**
   * Exchange code for User Access Token
   */
  async getAccessToken(code) {
    try {
      const response = await axios.get(`${this.graphApiUrl}/oauth/access_token`, {
        params: {
          client_id: this.appId,
          client_secret: this.appSecret,
          redirect_uri: this.redirectUri,
          code: code,
        },
      });
      return response.data.access_token;
    } catch (error) {
      console.error("Error getting access token:", error.response?.data || error.message);
      throw new Error("Failed to get access token from Facebook");
    }
  }

  /**
   * Get Instagram Business Account Details
   */
  async getInstagramDetails(accessToken) {
    try {
      // 1. Get User's Pages
      const pagesResponse = await axios.get(`${this.graphApiUrl}/me/accounts`, {
        params: {
          access_token: accessToken,
          fields: "name,instagram_business_account",
        },
      });

      const pages = pagesResponse.data.data;
      const connectedPage = pages.find((page) => page.instagram_business_account);

      if (!connectedPage) {
        throw new Error("No Instagram Business account connected to any Facebook Page.");
      }

      const instagramBusinessId = connectedPage.instagram_business_account.id;

      // 2. Get Instagram Details
      const instagramResponse = await axios.get(`${this.graphApiUrl}/${instagramBusinessId}`, {
        params: {
          access_token: accessToken,
          fields: "name,username,followers_count,profile_picture_url",
        },
      });

      return {
        ...instagramResponse.data,
        facebook_access_token: accessToken,
      };
    } catch (error) {
      console.error("Error getting Instagram details:", error.response?.data || error.message);
      throw new Error("Failed to get Instagram details");
    }
  }
}

export default new InstagramService();
