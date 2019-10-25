# frozen_string_literal: true

json.course do
will_paginate json.uploads @course.uploads.includes(:user) do |upload|
    json.call(upload, :id, :uploaded_at, :usage_count, :url, :thumburl, :deleted,
              :thumbwidth, :thumbheight)
    json.file_name pretty_filename(upload)
    json.uploader upload.user.username
  end
end
