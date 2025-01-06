import { BusterOrganizationRole } from '@/api/busterv2';
import { DropdownLabel } from '@/components/dropdown';
import { SelectProps } from 'antd';

export const createPermissionUserRoleName = (role: BusterOrganizationRole) => {
  const roleRecord: Record<BusterOrganizationRole, string> = {
    admin: 'Admin',
    member: 'Member',
    owner: 'Owner'
  };

  return roleRecord[role] || '';
};

export const permissionRolesOptions = [
  {
    value: 'none',
    label: 'No one'
  },
  {
    value: 'team',
    label: 'Team'
  },
  {
    value: 'organization',
    label: 'Organization'
  },
  {
    value: 'public',
    label: 'Public '
  }
];

//'none' | 'team' | 'organization' | 'public'
export const shareWithOptions = [
  {
    label: <DropdownLabel title={'No one'} subtitle="Cannot share with anyone" />,
    value: 'none'
  },
  {
    label: (
      <DropdownLabel
        title={'Anyone in shared teams'}
        subtitle={'Can share with anyone in shared teams'}
      />
    ),
    value: 'team'
  },
  {
    label: (
      <DropdownLabel title={'Anyone in workspace'} subtitle="Can share with anyone in workspace" />
    ),
    value: 'organization'
  },
  // {
  //   label: (
  //     <DropdownLabel
  //       title={'Anyone via email invite'}
  //       subtitle="Can share with external users via email invite."
  //     />
  //   ),
  //   value: 'organization'
  // },
  {
    label: (
      <DropdownLabel
        title={'Anyone via public URL'}
        subtitle="Can share publicly to the internet."
      />
    ),
    value: 'public'
  }
];

export const organizationRoleOptions = [
  {
    label: (
      <DropdownLabel
        title={createPermissionUserRoleName(BusterOrganizationRole.member)}
        subtitle="Member of the organization"
      />
    ),
    value: BusterOrganizationRole.member
  },
  {
    label: (
      <DropdownLabel
        title={createPermissionUserRoleName(BusterOrganizationRole.admin)}
        subtitle="Has administrative access over the account."
      />
    ),
    value: BusterOrganizationRole.admin
  },
  {
    label: (
      <DropdownLabel
        title={createPermissionUserRoleName(BusterOrganizationRole.owner)}
        subtitle="Owner of the organization"
      />
    ),
    value: BusterOrganizationRole.owner
  }
];

export enum UserApp {
  USERS = 'users',
  TEAMS = 'teams',
  PERMISSION_GROUPS = 'permission-groups'
}
