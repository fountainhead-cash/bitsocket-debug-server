# bitsocket-debug-server

Test bitsocket queries on your own provided transactions

# Usage

```
git clone https://github.com/fountainhead-cash/bitsocket-debug-server
cd bitsocket
npm install
cp .env.example .env
$(EDITOR) .env
npm start
```

You will see a screen like this:

![init](img/bitsocket_init.png)

Now open your browser to the socket URL and you'll see SSE pouring in.

![browser](img/raw.gif)

That's the raw firehose. You probably don't want to consume the whole thing, so make sure to add a bitquery filter. Learn more at [https://docs.fountainhead.cash](https://docs.fountainhead.cash)


# Changing transaction stream 

```
$(EDITOR) bit.js
```

Within `streamfn` you can use the methods `send_mempool` and `send_block`, you probably want to have everything wrapped within `setInterval` but it isn't necessary. Provide the raw TNA from transactions you receive using BitDB without jq modification, or.. write a program to generate transactions for you. Use `setTimeout` to schedule a future transaction, this way you can develop something similar to what your app sees.
