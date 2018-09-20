import { ApolloCache } from 'apollo-cache';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import SlicknodeLink from 'slicknode-apollo-link';
import Client, { Authenticator, AuthTokenSet, ClientOptions } from 'slicknode-client';

export interface IOptions {
  endpoint?: string;
  client?: Client;
  clientOptions?: ClientOptions;
  cache?: ApolloCache<any>;
}

class DefaultClient<TCache> extends ApolloClient<TCache> {
  /**
   * Slicknode client instance that holds auth keys and sends requests
   */
  private client: Client;

  /**
   * Constructor
   * @param {IOptions} options
   */
  constructor(options: IOptions) {
    // Check if one of endpoint or client was provided
    if (!options.endpoint && !options.client || options.endpoint && options.client) {
      throw new Error(
        'Invalid configuration: You have to provide either an endpoint or a slicknode client instance',
      );
    }

    // Create default client with endpoint if none was provided
    let client = options.client;
    if (!client) {
      client = new Client({
        endpoint: options.endpoint,
        ...(options.clientOptions ? options.clientOptions : {}),
      });
    }

    // Add in memory cache as default if none was provided
    let {cache} = options;
    if (!cache) {
      cache = new InMemoryCache();
    }

    // Create apollo link component to slicknode
    const slicknodeLink = new SlicknodeLink({
      client,
    });

    // Merge all links
    const link = ApolloLink.from([
      // TODO: Add more links here (error handling etc.)...
      slicknodeLink,
    ].filter((x) => !!x) as ApolloLink[]);

    super({
      link,
      cache,
    });

    this.client = client;
  }

  /**
   * Returns a promise that resolves the response of the authenticator
   *
   * @param authenticator
   * @returns {Promise.<*>}
   */
  public async authenticate(authenticator: Authenticator): Promise<AuthTokenSet> {
    return this.client.authenticate(authenticator);
  }

  /**
   * Logs the user out, removes all refresh / access tokens from storage
   */
  public async logout() {
    this.client.logout();
  }
}

export default DefaultClient;
