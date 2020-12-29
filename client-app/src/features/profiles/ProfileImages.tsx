import React, { useContext, useState } from "react";
import PhotoUploadWidget  from '../../app/common/imageUpload/imageUploadWidget';
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "../../app/stores/rootStore";
import { Card, Header, Tab, Image, Button, Grid } from "semantic-ui-react";

const ProfileImages: React.FC = () => {
  const rootStore = useContext(RootStoreContext);
  const { profile, isCurrentUser, uploadImage, uploadingImage, setMainPhoto, deletePhoto, loading } = rootStore.profileStore;

  const [ target, setTarget ] = useState<string | undefined>(undefined);
  const [ deleteTarget, setDeleteTarget ] = useState<string | undefined>(undefined);
  const [ addPhotoMode, setAddPhotoMode ] = useState(false);

  const handleUploadImage = (photo:Blob) => {
    uploadImage(photo).then(() => setAddPhotoMode(false))
  }

  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width={16} style={{ paddingBottom: 0 }}>
          <Header floated="left" icon="image" content="Photos" />
          {isCurrentUser && (
            <Button
              floated="right"
              basic
              content={addPhotoMode ? "Cancel" : "Add Photo"}
              onClick={() => setAddPhotoMode(!addPhotoMode)}
            />
          )}
        </Grid.Column>
        <Grid.Column width={16}>
          {addPhotoMode ? (
            <PhotoUploadWidget  uploadPhoto={handleUploadImage}  loading={uploadingImage}/>
          ) : (
            <Card.Group itemsPerRow={5}>
              {profile &&
                profile.photos.map((photo) => (
                  <Card key={photo.id}>
                    <Image src={photo.url} />
                    {isCurrentUser && 
                        <Button.Group fluid widths={2}>
                            <Button
                                namne={photo.id}
                                basic positive
                                content='Main'
                                loading={loading && target === photo.id}
                                onClick={(e) =>
                                {
                                  setMainPhoto(photo);
                                  setTarget(e.currentTarget.name);
                                }}
                            />
                            <Button
                                basic
                                negative
                                icon='trash'
                                name={photo.id}
                                disabled={photo.isMain}
                                onClick={(e) => {
                                  deletePhoto(photo);
                                  setDeleteTarget(e.currentTarget.name);
                                }}
                                loading={loading && deleteTarget === photo.id}
                            />
                        </Button.Group>
                    }
                  </Card>
                ))}
            </Card.Group>
          )}
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
};

export default observer(ProfileImages);
