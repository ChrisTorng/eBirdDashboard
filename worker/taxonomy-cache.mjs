// Cloudflare Workers may reuse resolved plain values, never a pending Promise
// or a Response/stream owned by another request.
export function createTaxonomyCache(fetcher,indexer){
 let ready;
 return async function get(){if(ready)return ready;const data=await fetcher();const index=indexer(data);ready={data,index};return ready};
}
