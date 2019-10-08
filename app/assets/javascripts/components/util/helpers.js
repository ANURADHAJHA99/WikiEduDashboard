import { getFiltered } from '../../utils/model_utils';
import { ASSIGNED_ROLE, REVIEWING_ROLE } from '../../constants/assignments';
import * as _ from 'lodash';

export const delayFetchAssignmentsAndArticles = (props, cb) => {
  const { loadingArticles, loadingAssignments } = props;
  if (!loadingArticles && !loadingAssignments) return cb();

  const requests = [];
  if (loadingAssignments) {
    requests.push(props.fetchAssignments(props.course_id));
  }
  if (loadingArticles) {
    requests.push(props.fetchArticles(props.course_id, props.limit));
  }

  Promise.all(requests).then(() => setTimeout(cb, 750));
};

const pluck = key => ({ [key]: val }) => val;

export const groupByAssignmentType = (assignments, user_id) => {
  // Unassigned to anyone
  const unassignedOptions = { user_id: null, role: ASSIGNED_ROLE };
  const unassigned = getFiltered(assignments, unassignedOptions);

  // Assigned to the current user
  const assignOptions = { user_id, role: ASSIGNED_ROLE };
  const assigned = getFiltered(assignments, assignOptions);

  // The current user is reviewing
  const reviewOptions = { user_id, role: REVIEWING_ROLE };
  const reviewing = getFiltered(assignments, reviewOptions);

  // To find articles that are able to be reviewed...
  const pluckArticleId = pluck('article_id');
  const assignedArticleIds = assigned.map(pluckArticleId);
  const reviewingArticleIds = reviewing.map(pluckArticleId);

  const allAssigned = getFiltered(assignments, { role: ASSIGNED_ROLE });
  const reviewableDuplicates = allAssigned.filter((assignment) => {
    // If the article doesn't have an article id, that means it's a new article,
    // so we want to allow for new articles to be reviewable as well as long as
    // it isn't the current user's new article.
    const { article_id: id, article_title: title, project } = assignment;
    // Check that the assignment is assigned to someone else
    if (!id && assignment.user_id && assignment.user_id !== user_id) {
      const all = assigned.concat(reviewing);
      // Find similar articles that have already been assigned
      const alreadyAssigned = all.find((assign) => {
        return assign.article_title === title && assign.project === project;
      });
      // Only return if it has not been assigned
      return !alreadyAssigned;
    }

    return assignment.user_id // ...the article must have a user_id
      // which shouldn't match the current user's id
      && assignment.user_id !== user_id
      // and should not be an article that is assigned to them
      && !assignedArticleIds.includes(id)
      // and should not be an article they are already reviewing
      && !reviewingArticleIds.includes(id);
  });

  const reviewable = _.uniqBy(reviewableDuplicates, 'article_url');
  return { assigned, reviewing, unassigned, reviewable };
};
