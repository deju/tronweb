import axios from 'axios';
import utils from 'utils';

export default class HttpProvider {
    constructor(host, proxy = {}, timeout = 30000, user = false, password = false, headers = {}, statusPage = '/') {
        if (!utils.isValidURL(host))
            throw new Error('Invalid URL provided to HttpProvider');

        if (isNaN(timeout) || timeout < 0)
            throw new Error('Invalid timeout duration provided');

        if (!utils.isObject(headers))
            throw new Error('Invalid headers object provided');

        if (!utils.isObject(proxy))
            throw new Error('Invalid proxy object provided');

        host = host.replace(/\/+$/, '');

        this.host = host;
        this.timeout = timeout;
        this.user = user;
        this.password = password;
        this.headers = headers;
        this.statusPage = statusPage;
        this.proxy = proxy;

        this.instance = axios.create({
            baseURL: host,
            timeout: timeout,
            headers: headers,
            auth: user && {
                user,
                password
            },
            proxy: (proxy && proxy.host) ? proxy : undefined,
        });
    }

    setStatusPage(statusPage = '/') {
        this.statusPage = statusPage;
    }

    async isConnected(statusPage = this.statusPage) {
        return this.request(statusPage).then(data => {
            return utils.hasProperties(data, 'blockID', 'block_header');
        }).catch(() => false);
    }

    request(url, payload = {}, method = 'get') {
        method = method.toLowerCase();

        return this.instance.request({
            data: method == 'post' && Object.keys(payload).length ? payload : null,
            params: method == 'get' && payload,
            url,
            method
        }).then(({data}) => data);
    }

    setProxy(proxy = {}) {
        if (!utils.isObject(proxy))
            throw new Error('Invalid proxy object provided');
        
        this.proxy = proxy;

        this.instance = axios.create({
            baseURL: this.host,
            timeout: this.timeout,
            headers: this.headers,
            auth: this.user && {
                user: this.user,
                password: this.password
            },
            proxy: (proxy && proxy.host) ? proxy : undefined
        });
    }
};
