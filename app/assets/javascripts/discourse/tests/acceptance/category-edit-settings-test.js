import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import { fixturesByUrl } from "discourse/tests/helpers/create-pretender";
import { acceptance, query } from "discourse/tests/helpers/qunit-helpers";
import selectKit from "discourse/tests/helpers/select-kit-helper";

acceptance("Category Edit - Settings", function (needs) {
  needs.user();

  needs.pretender((server, helper) => {
    const category = fixturesByUrl["/c/11/show.json"].category;
    category.permissions = [];

    server.get("/c/support/find_by_slug.json", () => {
      return helper.response(200, {
        category: { ...category, default_slow_mode_seconds: 600 },
      });
    });

    server.get("/c/uncategorized/find_by_slug.json", () => {
      return helper.response(200, {
        category: { ...category, id: 12, default_slow_mode_seconds: 1200 },
      });
    });
  });

  test("values updating while switching the category", async function (assert) {
    await visit("/c/uncategorized/edit/settings");

    assert.strictEqual(
      query("input#category-default-slow-mode").value,
      "20",
      "slow mode value is updated"
    );

    const categoryBreadcrumb = selectKit(".category-breadcrumb .select-kit");
    await categoryBreadcrumb.expand();
    await categoryBreadcrumb.fillInFilter("support");
    await categoryBreadcrumb.selectRowByIndex(0);

    assert.strictEqual(
      query("input#category-default-slow-mode").value,
      "10",
      "slow mode value is updated"
    );
  });
});
