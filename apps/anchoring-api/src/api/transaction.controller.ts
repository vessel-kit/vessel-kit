import { Controller, Get, Query } from "@nestjs/common";
import { TransactionStorage } from "../storage/transaction.storage";
import { TransactionPresentation } from "./transaction.presentation";
import { ApiOperation, ApiTags, ApiResponse } from "@nestjs/swagger";

const PAGE_SIZE = 25;

@Controller("/v0/transactions")
export class TransactionController {
  constructor(private readonly transactionStorage: TransactionStorage) {}

  @Get("/")
  @ApiTags("transactions")
  @ApiOperation({
    summary: "Get transaction list",
    description:
      "Gather statistics about transactions, " +
      "total amount of transactions, page size (for pagination)",
  })
  @ApiResponse({ status: 200, description: "Success" })
  @ApiResponse({ status: 500, description: "Error" })
  async index(@Query("page") pageIndex = 1) {
    const transactionRecords = await this.transactionStorage.page(
      pageIndex,
      PAGE_SIZE
    );
    const totalCount = await this.transactionStorage.count();
    return {
      transactions: transactionRecords.map(
        (a) => new TransactionPresentation(a)
      ),
      totalCount: totalCount,
      pageSize: PAGE_SIZE,
    };
  }
}
