import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Login from './login';
import { UserStore } from '../../../stores/userStore';

interface Props {
  userStore?: UserStore
}

@inject('userStore')
@observer
export default class Admin extends Component<Props> {
  render() {
    const isAdmin = this.props.userStore?.isAdmin;
    const username = this.props.userStore?.username;
    return (
      <>
      {username}
      { !isAdmin ?
        <Login />
        :
        <h1>Admin</h1>
      }
      </>
    )
  }
}