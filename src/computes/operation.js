import lineType from '@/computes/protocol/line_types';
import Constant from '@/data/const';
import hash from 'js-sha256';

export default class {
  constructor(queryClient, instances, profile) {
    this.client = queryClient;
    this.instances = instances;
    this.profile = profile;
  }

  async trigger(operation) {
    switch (operation.type) {
      case lineType.OpType.UPDATE_PROFILE: {
        const data = await this.client.getProfile();
        await this.instances.sync.syncProfile(data);
        break;
      }
      case lineType.OpType.ADD_CONTACT:
      case lineType.OpType.UPDATE_CONTACT: {
        const data = await this.client.getContact(operation.param1);
        this.instances.idb.user.put(Constant.IDB.USER.CONTACT, data);
        break;
      }
      case lineType.OpType.ACCEPT_GROUP_INVITATION: {
        this.instances.idb.user.delete(
            Constant.IDB.USER.GROUP.INVITED,
            operation.param1,
        );
        await this.saveGroupInfo(operation.param1, true);
        break;
      }
      case lineType.OpType.LEAVE_GROUP: {
        await this.clearMessageBox(operation.param1);
        this.vuex.commit(
            'unregisterChatIdHash',
            hash.sha256(operation.param1),
        );
        this.instances.idb.user.delete(
            Constant.IDB.USER.GROUP.JOINED,
            operation.param1,
        );
        break;
      }
      case lineType.OpType.NOTIFIED_CANCEL_INVITATION_GROUP: {
        if (operation.param3.includes('\x1e')) {
          operation.param3 = operation.param3
              .split('\x1e')
              .find((id) => id === this.profile.userId);
        }
        if (operation.param3 === this.profile.userId) {
          this.vuex.commit(
              'unregisterChatIdHash',
              hash.sha256(operation.param1),
          );
          this.instances.idb.user.delete(
              Constant.IDB.USER.GROUP.INVITED,
              operation.param1,
          );
        }
        break;
      }
      case lineType.OpType.NOTIFIED_KICKOUT_FROM_GROUP:
        if (operation.param3.includes('\x1e')) {
          operation.param3 = operation.param3
              .split('\x1e')
              .find((id) => id === this.profile.userId);
        }
        if (operation.param3 === this.profile.userId) {
          await this.instances.idb.clearMessageBox(operation.param1);
          this.vuex.commit(
              'unregisterChatIdHash',
              hash.sha256(operation.param1),
          );
          this.instances.idb.user.delete(
              Constant.IDB.USER.GROUP.JOINED,
              operation.param1,
          );
        } else {
          await this.saveGroupInfo(operation.param1);
        }
        break;
      case lineType.OpType.NOTIFIED_UPDATE_GROUP:
      case lineType.OpType.NOTIFIED_INVITE_INTO_GROUP:
      case lineType.OpType.NOTIFIED_ACCEPT_GROUP_INVITATION:
      case lineType.OpType.NOTIFIED_LEAVE_GROUP:
      case lineType.OpType.CREATE_GROUP:
      case lineType.OpType.UPDATE_GROUP:
      case lineType.OpType.CANCEL_INVITATION_GROUP:
      case lineType.OpType.INVITE_INTO_GROUP:
      case lineType.OpType.KICKOUT_FROM_GROUP:
        await this.saveGroupInfo(operation.param1);
        break;
      case lineType.OpType.SEND_MESSAGE:
      case lineType.OpType.RECEIVE_MESSAGE:
        // Add Target for index
        operation.message.target = (() => {
          switch (operation.message.toType) {
            case lineType.MIDType.USER:
              if (operation.message.from_ === this.profile.userId) {
                return operation.message.to;
              } else {
                return operation.message.from_;
              }
            case lineType.MIDType.ROOM:
            case lineType.MIDType.GROUP:
              return operation.message.to;
          }
        })();
        // Uint8Array to String
        operation.message.createdTime =
                    operation.message.createdTime.toString();
        operation.message.deliveredTime =
                    operation.message.deliveredTime.toString();
        this.instances.idb.user.put(
            Constant.IDB.USER.PREVIEW_MESSAGE_BOX,
            operation.message,
        );
        this.instances.idb.user.put(
            Constant.IDB.USER.MESSAGE_BOX,
            operation.message,
        );
        break;
    }
  }
}
