# frozen_string_literal: true

RSpec.describe "Summarize a channel since your last visit", type: :system, js: true do
  fab!(:current_user) { Fabricate(:user) }
  fab!(:group) { Fabricate(:group) }
  let(:plugin) { Plugin::Instance.new }

  fab!(:channel) { Fabricate(:chat_channel) }

  fab!(:message_1) { Fabricate(:chat_message, chat_channel: channel) }

  let(:chat) { PageObjects::Pages::Chat.new }

  before do
    group.add(current_user)

    strategy = DummyCustomSummarization.new("dummy")
    plugin.register_summarization_strategy(strategy)
    SiteSetting.summarization_strategy = strategy.model
    SiteSetting.custom_summarization_allowed_groups = group.id.to_s

    SiteSetting.chat_enabled = true
    SiteSetting.chat_allowed_groups = group.id.to_s
    sign_in(current_user)
    chat_system_bootstrap(current_user, [channel])
  end

  it "displays a summary of the messages since the selected timeframe" do
    chat.visit_channel(channel)

    find(".chat-composer-dropdown__trigger-btn").click
    find(".chat-composer-dropdown__action-btn.channel-summary").click

    expect(page.has_css?(".channel-summary-modal", wait: 5)).to eq(true)

    find(".summarization-since").click
    find(".select-kit-row[data-value=\"3\"]").click

    expect(find(".summary-area").text).to eq(DummyCustomSummarization::RESPONSE)
  end
end
