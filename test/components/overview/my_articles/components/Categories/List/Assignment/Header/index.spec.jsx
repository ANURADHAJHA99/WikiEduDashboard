import React from 'react';
import { shallow } from 'enzyme';
import '../../../../../../../../testHelper';

import Header from '../../../../../../../../../app/assets/javascripts/components/overview/my_articles/components/Categories/List/Assignment/Header';

describe('Header', () => {
  const props = {
    article: {},
    articleTitle: 'title',
    assignment: {},
    course: { slug: 'course/slug', type: 'ClassroomProgramCourse' },
    current_user: {},
    isComplete: true,
    username: 'username',
    deleteAssignment: jest.fn(),
    fetchAssignments: jest.fn(),
    initiateConfirm: jest.fn(),
    updateAssignmentStatus: jest.fn()
  };

  it('displays the links and actions', () => {
    const component = shallow(<Header {...props} />);
    expect(component).toMatchSnapshot();
  });
});
