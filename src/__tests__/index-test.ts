import {expect} from 'chai';
import { parse } from 'graphql';
import sinon from 'sinon';
import Client from 'slicknode-client';
import ApolloClient from '../index';

/* tslint:disable:no-unused-expression */

describe('ApolloClient', () => {
  it('is exported from bundle', () => {
    expect(ApolloClient).to.not.be.undefined;
  });

  it('creates a client with default settings', () => {
    const client = new ApolloClient({
      endpoint: 'http://localhost',
    });
    expect(client.link).to.not.be.undefined;
    expect(client.store).to.not.be.undefined;
  });

  it('throws error when endpoint is missing', () => {
    expect(() => {
      const client = new ApolloClient({});
    }).to.throw('Invalid configuration: You have to provide either an endpoint or a slicknode client instance');
  });

  it('throws error when both client and endpoint are provided', () => {
    expect(() => {
      const slicknodeClient = new Client({endpoint: 'http://localhost'});
      const client = new ApolloClient({
        endpoint: 'http://localhost',
        client: slicknodeClient,
      });
    }).to.throw('Invalid configuration: You have to provide either an endpoint or a slicknode client instance');
  });

  it('fetches data via ApolloClient', async () => {
    const slicknodeClient = new Client({endpoint: 'http://localhost'});
    const payload = {
      data: {
        value: 'test',
      },
    };

    sinon.stub(slicknodeClient, 'fetch').resolves(payload);

    const client = new ApolloClient({
      client: slicknodeClient,
    });

    const result = await client.query({
      query: parse('{value}'),
    });

    expect(result.data).to.deep.equal(payload.data);
  });

  it('sets authentication headers for client', async () => {
    const slicknodeClient = new Client({endpoint: 'http://localhost'});

    const client = new ApolloClient({
      client: slicknodeClient,
    });

    const tokenSet = {
      accessToken: '123',
      accessTokenLifetime: 234,
      refreshToken: 'sergserg',
      refreshTokenLifetime: 234,
    };

    await client.authenticate(async () => tokenSet);

    expect(slicknodeClient.hasRefreshToken()).to.equal(true);
    expect(slicknodeClient.hasAccessToken()).to.equal(true);
    expect(slicknodeClient.getAccessToken()).to.equal(tokenSet.accessToken);
    expect(slicknodeClient.getRefreshToken()).to.equal(tokenSet.refreshToken);
  });

  it('removes access token from client on logout', async () => {
    const slicknodeClient = new Client({endpoint: 'http://localhost'});

    const client = new ApolloClient({
      client: slicknodeClient,
    });

    const tokenSet = {
      accessToken: '123',
      accessTokenLifetime: 234,
      refreshToken: 'sergserg',
      refreshTokenLifetime: 234,
    };

    await client.authenticate(async () => tokenSet);

    expect(slicknodeClient.hasRefreshToken()).to.equal(true);
    expect(slicknodeClient.hasAccessToken()).to.equal(true);
    expect(slicknodeClient.getAccessToken()).to.equal(tokenSet.accessToken);
    expect(slicknodeClient.getRefreshToken()).to.equal(tokenSet.refreshToken);

    await client.logout();

    expect(slicknodeClient.hasRefreshToken()).to.equal(false);
    expect(slicknodeClient.hasAccessToken()).to.equal(false);
    expect(slicknodeClient.getAccessToken()).to.equal(null);
    expect(slicknodeClient.getRefreshToken()).to.equal(null);
  });
});
