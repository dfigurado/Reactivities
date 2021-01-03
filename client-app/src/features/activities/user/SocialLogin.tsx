import React from 'react';
import { Button, Icon } from 'semantic-ui-react';
import { observer } from 'mobx-react-lite';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

interface IProps  {
    fbCallback: (response:any) => void;
    loading: boolean;
}

const SocialLogin: React.FC<IProps> = ({ fbCallback, loading }) => {
    return (
        <div>
            <FacebookLogin
                appId='206031677848058'
                fields='name,email,picture'
                callback={fbCallback}
                render={(renderProps: any) => (
                    <Button onClick={renderProps.onClick} type="button" fluid color="facebook" loading={loading} title='Developer mode only.'>
                       <Icon name='facebook' />
                       Login
                    </Button>
                )}
            />
        </div>
    )
}

export default observer(SocialLogin);
