import { Net } from './net';
import { randomAvatar } from './ui/avatars';

// Entry point for the player (mobile) screen
const net = new Net();

// For now just auto-join in debug mode using query string ?code=ABCD&name=Foo
const params = new URLSearchParams(location.search);
const code = params.get('code') || '';
const name = params.get('name') || `Player`;

if (code) {
  net.send({ t: 'player:join', code, name, avatar: randomAvatar() });
}

net.onMessage(msg => {
  // Placeholder: handle server messages
  console.log('message', msg);
});
